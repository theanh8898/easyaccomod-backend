function uploadUrl(path) {
  return 'upload/' + path;
}

function mapImages(objects, images) {
  if (!objects) {
    return objects;
  }
  const map = {};
  images = images.map(function (image) {
    const img = {...image, url: uploadUrl(image.path)};
    delete img.path;
    return img;
  });
  images.forEach(function (image) {
    if (!map[image.object_id]) {
      map[image.object_id] = [];
    }
    map[image.object_id].push(image);
  });
  let arr = Array.isArray(objects) ? objects : [objects];
  arr = arr.map(function (obj) {
    return {
      ...obj,
      images: map[obj.id] || [],
    };
  });
  if (Array.isArray(objects)) {
    return arr;
  }
  return arr.length ? arr[0] : null;
}

function mapResources(objects, resources, reference_field, field) {
  if (!objects) {
    return objects;
  }
  const map = {};
  resources.forEach(function (item) {
    map[item.id] = item;
  });
  let arr = Array.isArray(objects) ? objects : [objects];
  arr = arr.map(function (obj) {
    return {
      ...obj,
      [field]: map[obj[reference_field]] || null,
    };
  });
  if (Array.isArray(objects)) {
    return arr;
  }
  return arr.length ? arr[0] : null;
}

function getPagination(params) {
  let page = (params.page || 1) * 1;
  let pageSize = (params.pageSize || 10) * 1;
  if (Number.isNaN(page)) {
    page = 1;
  }
  if (Number.isNaN(pageSize)) {
    pageSize = 10;
  }
  return {
    page,
    pageSize,
  };
}

module.exports = {
  uploadUrl,
  mapImages,
  mapResources,
  getPagination,
};
