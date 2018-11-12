module.exports = {

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

  }

};
