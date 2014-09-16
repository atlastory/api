module.exports = {
  add: {
    node1: {
      action: 'add',
      object: 'node',
      object_id: 'n-1',
      geometry: [5.2, 7.8]
    },
    node2: {
      action: 'add',
      object: 'node',
      object_id: 'n-2',
      geometry: [6.2, 9.8],
      data: { source_id: 3 }
    },
    way1: {
      action: 'add',
      object: 'way',
      object_id: 'w-1',
      way_nodes: ['n-1','n-2']
    },
    way2: {},
    shape1: {
      action: 'add',
      object: 'shape',
      object_id: 's-1',
      data: { start_year: 1000, name: 'test' },
      shape_relations: ['0-Way-outer-w-1','1-Way-inner-239283']
    }
  },
  edit: {},
  delete: {}
};
