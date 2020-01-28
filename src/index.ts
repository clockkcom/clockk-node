import request from 'request';
import { Deserializer, Serializer } from 'ts-jsonapi';

export interface IClockkToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  created_at: Date;
  scope: string;
}

export interface IClockkOptions {
  token?: IClockkToken;
  api_url?: string;
  customer_id?: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export class Clockk {
  constructor(public options: IClockkOptions) { }

  public async exchangeCodeForToken(code: string) {
    return new Promise<IClockkToken>((resolve, reject) => {
      request.post(
        {
          url: `${this.options.api_url}/oauth/token?client_id=${this.options.client_id}&client_secret=${this.options.client_secret}&grant_type=authorization_code&code=${code}&redirect_uri=${this.options.redirect_uri}`,
        },
        (error: any, response: any, body: any) => {
          if (error) {
            reject(error);
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              const token = JSON.parse(body);
              this.options.token = token;
              resolve(token);
            } else {
              reject(response);
            }
          }
        },
      );
    });
  }

  public async refreshToken() {
    return new Promise<IClockkToken>((resolve, reject) => {
      if (!this.options.token) {
        reject('token option must be set in constructor');
      }
      request.post(
        {
          url: `${this.options.api_url}/oauth/token?client_id=${this.options.client_id}&client_secret=${this.options.client_secret}&grant_type=refresh_token&refresh_token=${this.options.token?.refresh_token}`,
        },
        (error: any, response: any, body: any) => {
          if (error) {
            reject(error);
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              const token = JSON.parse(body);
              this.options.token = token;
              resolve(token);
            } else {
              reject(response);
            }
          }
        },
      );
    });
  }

  public getCustomer() {
    return this.clockkGetRequest('/oauth/me');
  }

  public async getProject(id: number, include: { client: boolean } = { client: false }) {
    return new Promise(async (resolve, reject) => {
      if (!this.options.customer_id) {
        reject('customer_id option must be set');
      }
      let includeQuery = 'integration-performed-actions';
      if (include.client) {
        includeQuery += ',client.integration-performed-actions';
      }
      const project = await this.clockkGetRequest(
        '/api/v1/' + this.options.customer_id + '/projects/' + id,
        includeQuery,
      ).catch(error => {
        reject(error);
      });
      resolve(project);
    });
  }

  public async getProjects(include: { client: boolean } = { client: false }) {
    return new Promise(async (resolve, reject) => {
      if (!this.options.customer_id) {
        reject('customer_id option must be set');
      }
      let includeQuery = 'integration-performed-actions';
      if (include.client) {
        includeQuery += ',client.integration-performed-actions';
      }
      const projects = await this.clockkGetRequest(
        '/api/v1/' + this.options.customer_id + '/projects',
        includeQuery,
      ).catch(error => {
        reject(error);
      });
      resolve(projects);
    });
  }

  /*
  Create an Clockk integration performed action. This will close any open modals in the Clockk user interface
  and the data enclosed here will be included the next time this resource is sent to your integration.

  actionCode: The action code identifier defined in the integration management page https://app.clockk.com/integration-listings
  resourceType: The name of the resource type, dasherized
  actionData: The payload of JSON formatted data you would like stored with this integration performed action. Max size 2KB

  example:
  Clockk.createIntegrationPerformedAction(
    'LINK_TASK_TYPE_TO_INTEGRATION',
    {
      id: '96a770cd-b677-49dc-b733-f4b53197f81c',
      name: 'Programming',
      description: 'Elixir rocks'
    },
    {
      additionalInfo: 'arbitrary information about this task type'
    }
  )
  */
  public async createIntegrationPerformedAction(actionCode: string, resource: any, actionData: any) {
    return new Promise(async (resolve, reject) => {
      const resourceType = await this.getResourceTypeFromResource(resource);
      const attrs: any = {
        'action-code': actionCode,
        metadata: actionData,
      };
      attrs[resourceType + '-id'] = resource.id;
      const data = new Serializer('integration-performed-actions', {
        id: 'id',
        attributes: ['metadata', 'action-code', `${resourceType}-id`],
      }).serialize(attrs);

      const ipa = await this.clockkCreateRequest('integration-performed-actions', data).catch(error => {
        reject(error);
      });
      resolve(ipa);
    });
  }

  private async clockkGetRequest(appendUrl: string, include?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.options.token) {
        reject('token option must be set in constructor');
      }
      let url = `${this.options.api_url}${appendUrl}`;
      if (include) {
        url += `?include=${include}`;
      }
      request.get(
        {
          headers: {
            Authorization: this.options.token?.access_token,
          },
          url,
        },
        async (error: any, response: any, body: any) => {
          if (error) {
            reject(error);
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              resolve(new Deserializer().deserialize(JSON.parse(body)));
            } else {
              reject(response);
            }
          }
        },
      );
    });
  }

  private getResourceTypeFromResource(resource: any) {
    return new Promise<string>((resolve, reject) => {
      let resourceType: string = '';
      switch (true) {
        case typeof resource.color !== 'undefined':
          resourceType = 'project';
          break;

        case typeof resource.time_sheet_date !== 'undefined':
          resourceType = 'time-sheet';
          break;

        case typeof resource.duration !== 'undefined':
          resourceType = 'time-sheet-entry';
          break;

        case typeof resource.notes !== 'undefined':
          resourceType = 'client';
          break;

        case typeof resource.description !== 'undefined':
          resourceType = 'task-type';
          break;

        default:
          reject(
            'invalid resource. This property should not be modified from the version supplied in the inital Clockk action request',
          );
      }
      resolve(resourceType);
    });
  }

  private async clockkCreateRequest(appendUrl: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.options.customer_id) {
        reject('customer_id option must be set');
      }
      if (!this.options.token) {
        reject('token option must be set in constructor');
      }

      request.post(
        {
          body: JSON.stringify(payload),
          headers: {
            Authorization: this.options.token?.access_token,
            'Content-Type': 'application/vnd.api+json',
          },
          url: `${this.options.api_url}/api/v1/${this.options.customer_id}/${appendUrl}`,
        },
        async (error: any, response: any, body: any) => {
          if (error) {
            reject(error);
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              resolve(new Deserializer().deserialize(JSON.parse(body)));
            } else {
              reject(response);
            }
          }
        },
      );
    });
  }
}
