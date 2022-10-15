const {ATTRIBUTE_VALUE_TYPE} = require('../constants');
const {table} = require('../database');

module.exports.locationsSchema = {
  province_id: {
    custom: {
      options: async (value) => {
        if (!value) {
          throw new Error('Province is required');
        }
        const province = await table('provinces').findOne({
          id: value,
        });
        if (!province) {
          throw new Error('Province not existed');
        }
      }
    }
  },
  district_id: {
    custom: {
      options: async (value, {req}) => {
        if (!value) {
          throw new Error('District is required');
        }
        if (!req.body.province_id) {
          throw new Error('Province is required');
        }
        const district = await table('districts').findOne({
          id: value,
        });
        if (!district) {
          throw new Error('District not existed');
        }
        if (district.province_id !== req.body.province_id * 1) {
          throw new Error('District and province not match');
        }
      }
    }
  },
  ward_id: {
    custom: {
      options: async (value, {req}) => {
        if (!value) {
          throw new Error('Ward is required');
        }
        if (!req.body.district_id) {
          throw new Error('District is required');
        }
        const ward = await table('wards').findOne({
          id: value,
        });
        if (!ward) {
          throw new Error('Ward not existed');
        }
        if (ward.district_id !== req.body.district_id * 1) {
          throw new Error('Ward and district not match');
        }
      }
    }
  },
};

module.exports.attributesSchema = {
  attributes: {
    custom: {
      options: async (value) => {
        if (!value) {
          return;
        }
        if (!Array.isArray(value)) {
          throw new Error('Attributes must be array');
        }
        if (!value.length) {
          return;
        }
        let attributeIds = {};
        for (let i = 0; i < value.length; i++) {
          if (!value[i].attribute_id) {
            throw new Error('Attribute item must has attribute_id');
          }
          if (value[i].int_value === undefined && value[i].text_value === undefined) {
            throw new Error('Invalid attribute value');
          }
          const attributeId = value[i].attribute_id;
          attributeIds[attributeId] = attributeId;
        }
        attributeIds = Object.values(attributeIds);
        const attributes = await table('attributes').findAll({id: attributeIds});
        const attributeValueType = {};
        attributes.forEach(function (item) {
          attributeValueType[item.id] = item.value_type;
        });
        for (let i = 0; i < value.length; i++) {
          const attributeId = value[i].attribute_id;
          if (!attributeValueType[attributeId]) {
            throw new Error('Invalid attribute id');
          }
          if (attributeValueType[attributeId] === ATTRIBUTE_VALUE_TYPE.INTEGER && value[i].int_value === undefined) {
            throw new Error('Invalid attribute value');
          }
          if (attributeValueType[attributeId] === ATTRIBUTE_VALUE_TYPE.TEXT && value[i].text_value === undefined) {
            throw new Error('Invalid attribute value');
          }
        }
      }
    }
  }
};
