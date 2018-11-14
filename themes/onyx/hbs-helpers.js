module.exports = {

  getVersionLink: (version) => {

    if ( version === 'All' ) return 'all';

    return version;

  },

  getBodyTypeText: (type) => {

    switch (type.trim().toLowerCase()) {

      case 'application/json':
        return 'JSON';

      case 'application/xml':
        return 'XML';

      case 'application/octet-stream':
        return 'Binary';

      case 'text':
      case 'text/plain':
        return 'Text';

      case 'x-www-form-urlencoded':
        return 'Form Data';

      case 'multipart/form-data':
        return 'Multipart';

      default:
        return 'Other';

    }

  },

  getLoaderName: (flavor) => {

    return flavor === 'dark' ? 'loader-dark' : 'loader-light'

  },

  isSectionParent: (sections, index) => {

    const current = sections[index];

    if ( index === sections.length - 1 ) return false;

    const next = sections[index + 1];

    return current.level < next.level;

  },

  isSectionLastChild: (sections, index) => {

    const current = sections[index];

    if ( index === sections.length - 1 ) {

      return current.level > 0;

    }

    const next = sections[index + 1];

    return current.level > next.level;

  },

  getLastChildClosingTag: (sections, index) => {

    const current = sections[index];

    if ( index === sections.length - 1 ) {

      return '</div>'.repeat(current.level);

    }

    const next = sections[index + 1];

    return '</div>'.repeat(current.level - next.level);

  }

};
