var request = require('request');
import { Serializer, Deserializer } from 'ts-jsonapi';

export interface ClockkToken {
  access_token: String,
  refresh_token: String,
  token_type: String,
  expires_in: Number
  created_at: Date,
  scope: String
}

export interface ClockkOptions {
  token?: ClockkToken,
  api_url?: String,
  customer_id?: String,
  client_id: String,
  client_secret: String,
  redirect_uri: String
}

export class Clockk {
  constructor(public options: ClockkOptions) { }

  async exchangeCodeForToken(code: String) {
    return new Promise<ClockkToken>((resolve, reject) => {
      request
        .post(
          { url: `${this.options.api_url}/oauth/token?client_id=${this.options.client_id}&client_secret=${this.options.client_secret}&grant_type=authorization_code&code=${code}&redirect_uri=${this.options.redirect_uri}` },
          (error: any, response: any, body: any) => {
            if (error) {
              reject(error);
            } else {
              if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                let token = JSON.parse(body);
                this.options.token = token;
                resolve(token);
              } else {
                reject(response);
              }
            }
          }
        )
    });
  }

  async refreshToken() {
    return new Promise<ClockkToken>((resolve, reject) => {
      if (!this.options.token) {
        reject("token option must be set in constructor")
      }
      request
        .post(
          { url: `${this.options.api_url}/oauth/token?client_id=${this.options.client_id}&client_secret=${this.options.client_secret}&grant_type=refresh_token&refresh_token=${this.options.token?.refresh_token}` },
          (error: any, response: any, body: any) => {
            if (error) {
              reject(error);
            } else {
              if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                let token = JSON.parse(body);
                this.options.token = token;
                resolve(token);
              } else {
                reject(response);
              }
            }
          }
        )
    });
  }

  private async clockkGetRequest(appendUrl: String, include?: String): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.options.token) {
        reject("token option must be set in constructor")
      }
      let url = `${this.options.api_url}${appendUrl}`
      if (include) {
        url += `?include=${include}`
      }
      request
        .get({
          url: url,
          headers: {
            'Authorization': this.options.token?.access_token
          }
        }, async (error: any, response: any, body: any) => {
          if (error) {
            reject(error);
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              resolve(new Deserializer().deserialize(JSON.parse(body)))
            } else {
              reject(response);
            }
          }
        })
    })
  }

  getCustomer() {
    return this.clockkGetRequest("/oauth/me")
  }

  async getProject(id: Number, include: { client: Boolean } = { client: false }) {
    return new Promise(async (resolve, reject) => {
      if (!this.options.customer_id) {
        reject("customer_id option must be set")
      }
      let includeQuery = 'integration-performed-actions'
      if (include.client) includeQuery += ',client.integration-performed-actions'
      let project =
        await this.clockkGetRequest("/api/v1/" + this.options.customer_id + "/projects/" + id, includeQuery)
          .catch(error => {
            reject(error)
          })
      resolve(project)
    })
  }

  async getProjects(include: { client: Boolean } = { client: false }) {
    return new Promise(async (resolve, reject) => {
      if (!this.options.customer_id) {
        reject("customer_id option must be set")
      }
      let includeQuery = 'integration-performed-actions'
      if (include.client) includeQuery += ',client.integration-performed-actions'
      let projects =
        await this.clockkGetRequest("/api/v1/" + this.options.customer_id + "/projects", includeQuery)
          .catch(error => {
            reject(error)
          })
      resolve(projects)
    })
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
  async createIntegrationPerformedAction(actionCode: String, resource: any, actionData: any) {
    return new Promise(async (resolve, reject) => {
      let resourceType = await this.getResourceTypeFromResource(resource)
      let attrs: any = {
        'metadata': actionData,
        'action-code': actionCode,
      }
      attrs[resourceType + '-id'] = resource.id
      let data =
        new Serializer(
          'integration-performed-actions',
          { id: 'id', attributes: ['metadata', 'action-code', `${resourceType}-id`] }
        )
          .serialize(attrs)

      let ipa =
        await this.clockkCreateRequest('integration-performed-actions', data)
          .catch(error => {
            reject(error)
          })
      resolve(ipa)
    })
  }

  private getResourceTypeFromResource(resource: any) {
    return new Promise<String>((resolve, reject) => {
      let resourceType: String = ''
      switch (true) {
        case typeof resource.color != 'undefined':
          resourceType = 'project'
          break;

        case typeof resource.time_sheet_date != 'undefined':
          resourceType = 'time-sheet'
          break;

        case typeof resource.duration != 'undefined':
          resourceType = 'time-sheet-entry'
          break;

        case typeof resource.notes != 'undefined':
          resourceType = 'client'
          break;

        case typeof resource.description != 'undefined':
          resourceType = 'task-type'
          break;

        default:
          reject('invalid resource. This property should not be modified from the version supplied in the inital Clockk action request')
      }
      resolve(resourceType)
    })
  }

  private async clockkCreateRequest(appendUrl: String, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.options.customer_id) {
        reject("customer_id option must be set")
      }
      if (!this.options.token) {
        reject("token option must be set in constructor")
      }

      request
        .post({
          url: `${this.options.api_url}/api/v1/${this.options.customer_id}/${appendUrl}`,
          headers: {
            'Authorization': this.options.token?.access_token,
            'Content-Type': 'application/vnd.api+json'
          },
          body: JSON.stringify(payload)
        }, async (error: any, response: any, body: any) => {
          if (error) {
            reject(error);
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              resolve(new Deserializer().deserialize(JSON.parse(body)))
            } else {
              reject(response);
            }
          }
        })
    })
  }
}