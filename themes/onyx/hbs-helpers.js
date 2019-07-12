module.exports = {

  getPoweredLogoByFlavor: (flavor) => {

    return flavor === 'dark' ? '-dark' : '';

  },

  isFirstSection: (path) => {

    return path === '0';

  },

  getPreviousSectionLink: (sections, path) => {

    let previousSection;

    for ( const section of sections ) {

      if ( section.selected ) return previousSection ? previousSection.link : undefined;

      previousSection = section;

    }

  },

  getNextSectionLink: (sections) => {

    let selected = false;

    for ( const section of sections ) {

      if ( section.selected ) selected = true;
      else if ( selected ) return section.link;

    }

    if ( selected ) return;

    return sections.length ? sections[0].link : undefined;

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

  },

  notLastContent: (contents, index) => {

    return index !== contents.length - 1;

  }

};
