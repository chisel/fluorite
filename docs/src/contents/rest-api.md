REST APIs can be documented using JSON files. You can include these files in the `blueprint` of the `flconfig.json` just like the Markdown files.

A REST API documentation JSON file may have the following properties:

  - **title**: The endpoint's title.
  - **description**: The endpoint's description.
  - **auth**: Namespace.
    - **enabled**: A boolean indicating if the endpoint is protected.
    - **description**: The description of the authentication method in place.
  - **path**: The path of the endpoint.
  - **method**: The HTTP method of the endpoint.
  - **params**: An array of route parameter objects.
    - **name**: Parameter name.
    - **type**: Parameter type.
    - **description**: Parameter description.
  - **queries**: An array of query objects.
    - **name**: The name of the query.
    - **type**: The type of the query.
    - **required**: A boolean indicating if the query is required.
    - **description**: The query description.
  - **request**: Namespace.
    - **headers**: An array of request headers.
      - **name**: Header name.
      - **description**: Header description.
    - **cookies**: An array of cookie objects.
      - **name**: The cookie name.
      - **description**: The cookie description.
    - **body**: An array of body objects.
      - **type**: The content type of the body (`application/json`, `application/xml`, `multipart/form-data`, `x-www-form-urlencoded`, `text/plain`, etc.)
      - **model**: A JSON object for type `application/json`, or an array of property objects (similar to `queries`) with `name`, `type`, `required`, and `description` fields for types `multipart/form-data` and `x-www-form-urlencoded`. For type `application/xml`, use `externalFile` instead. For any other types (e.g. `text/plain`), use `description` instead.
      - **externalFile**: The path to a model file (either `.json` or `.xml`.) Use this if you're not embedding the model or need to provide a XML model.
      - **description**: Used for `type`s that don't need a model.
  - **response**: Namespace.
    - **headers**: Same as `request.headers`.
    - **cookies**: Same as `request.cookies`.
    - **body**: Same as `request.body`.
  - **examples**: An array of example objects.
    - **path**: The path of the example endpoint.
    - **request**: Namespace for the example request.
      - **headers**: Key pair value object containing the example request headers.
      - **cookies**: Key pair value object containing the example request cookies.
      - **body**: Namespace for the example request body.
        - **type**: The body content type.
        - **externalFile**: Path to the external body model.
        - **value**: The value of the body (if `externalFile` is not used.)
    - **response**: Namespace for the example response.
      - **status**: The status code.
      - **headers**: Key pair value object containing the example response headers.
      - **cookies**: Key pair value object containing the example response cookies.
      - **body**: Namespace for the example response body.
        - **type**: The body content type.
        - **externalFile**: Path to the external body model.
        - **value**: The value of the body (if `externalFile` is not used.)

> The `externalFile` paths must be relative to the `flconfig.json` regardless of the `basePath`.

## Example

The following JSON object will be rendered as shown in the [REST API Example]({{versionRootPrefix}}/contents/rest-api-example):

```json
{
  "title": "Add a new pet",
  "description": "This endpoint adds a new pet in the database.",
  "auth": {
    "enabled": true,
    "description": "Authentication is done using a bearer token obtained from the `/auth/getToken` endpoint."
  },
  "path": "/pets/add/",
  "method": "POST",
  "params": [
    { "name": "database", "type": "string", "description": "The database name to add the pet in" }
  ],
  "queries": [
    { "name": "xml", "type": "boolean", "required": false, "description": "If present, the response type would be XML instead of JSON" }
  ],
  "response": {
    "headers": [
      { "name": "Content-Type", "description": "The content type of the body" }
    ],
    "cookies": [
      { "name": "trackerid", "description": "The tracker ID" }
    ],
    "body": [
      { "type": "application/json", "model": {
        "success": true,
        "message": "string"
      }},
      { "type": "application/xml", "externalFile": "src/models/response.model.xml" }
    ]
  },
  "request": {
    "headers": [
      { "name": "Content-Type", "description": "The content type of the body" }
    ],
    "cookies": [
      { "name": "trackerid", "description": "The tracker ID" }
    ],
    "body": [
      { "type": "application/json", "model": {
        "name": "The pet name",
        "type": "The pet type (dog, bird, etc.)",
        "breed": "The pet breed (optional)"
      }},
      { "type": "application/xml", "externalFile": "src/models/request.model.xml" },
      { "type": "multipart/form-data", "model": [
        { "key": "name", "type": "string", "required": true, "description": "The pet name" },
        { "key": "type", "type": "string", "required": true, "description": "The pet type (dog, bird, etc.)" },
        { "key": "breed", "type": "string", "required": false, "description": "The pet breed" }
      ]},
      { "type": "x-www-form-urlencoded", "model": [
        { "key": "name", "type": "string", "required": true, "description": "The pet name" },
        { "key": "type", "type": "string", "required": true, "description": "The pet type (dog, bird, etc.)" },
        { "key": "breed", "type": "string", "required": false, "description": "The pet breed" }
      ]},
      { "type": "text/plain", "description": "A CSV file with columns 'name', 'type', and 'breed'" }
    ]
  },
  "examples": [{
    "path": "/pets/add/petsDb?xml=true",
    "response": {
      "status": 200,
      "headers": {
        "Content-Type": "application/xml"
      },
      "cookies": {
        "trackerid": "ge8s7ecs69er8vfseasdg0s8d6fgvsdf"
      },
      "body": {
        "type": "application/xml",
        "externalFile": "src/models/response.value.xml"
      }
    },
    "request": {
      "headers": {
        "Content-Type": "application/json"
      },
      "cookies": {
        "trackerid": "ge8s7ecs69er8vfseasdg0s8d6fgvsdf"
      },
      "body": {
        "type": "application/json",
        "value": {
          "name": "Bob",
          "type": "Pig",
          "breed": "Miniature Pig"
        }
      }
    }
  }]
}
```
