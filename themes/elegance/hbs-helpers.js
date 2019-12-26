module.exports = {
  getDate: () => {

    const date = new Date();

    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  },
  isRootSelected: sections => ! sections.filter(section => section.selected).length,
  isNavSub: path => path.includes('/'),
  isNavFirstSub: (sections, index) => {

    if ( index === 0 ) return false;

    return sections[index].level - sections[index - 1].level === 1;

  },
  isNavLastSub: (sections, index) => {

    if ( index === sections.length - 1 ) return false;

    return sections[index + 1].level - sections[index].level < 0;

  },
  notLastContent: (contents, index) => index !== contents.length - 1,
  getMethodColor: method => obj({ get: 'green', delete: 'red', post: 'blue', put: 'magenta' })[method.trim().toLowerCase()] || 'gray',
  getStatusColor: status => {

    const code = +status;

    if ( isNaN(code) ) return 'gray';
    if ( code >= 100 && code <= 199 ) return 'blue';
    if ( code >= 200 && code <= 299 ) return 'green';
    if ( code >= 300 && code <= 399 ) return 'magenta';
    if ( code >= 400 && code <= 599 ) return 'red';

    return 'gray';

  },
  doesBodyTypeNeedTable: type => ['multipart/form-data', 'application/x-www-form-urlencoded'].includes(type.trim().toLowerCase()),
  atIndex: (array, index) => array[index],
  getExampleBody: (examples, exampleIndex, type) => examples[exampleIndex][type].body,
  getExampleKeyValuePair: (examples, exampleIndex, type, pairType) => examples[exampleIndex][type][pairType],
  getMimeName: mime => obj({ 'application/json': 'JSON', 'application/xml': 'XML', 'multipart/form-data': 'Form Data', 'application/x-www-form-urlencoded': 'Form Urlencoded', 'text/plain': 'Text', 'application/octet-stream': 'Stream' })[mime.trim().toLowerCase()] || undefined,
  wrapAsModel: value => obj({ model: value }),
  wrapAsValue: value => obj({ value: value }),
  decrement: value => value - 1,
  isVersionSelected: (current, target) => current === target,
  reverseArrayOrder: array => array.concat().reverse()
};

const obj = object => object;
