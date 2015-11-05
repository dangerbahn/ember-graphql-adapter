import { test, module } from 'qunit';
import Parser from 'graphql-adapter/parser';
import * as Type from 'graphql-adapter/types';
import ArgumentSet from 'graphql-adapter/types/argument-set';
import ModelDouble from '../helpers/model-double';
import StoreDouble from '../helpers/store-double';

module('unit:graphql-adapter/parser', {
  setup: function() {
    let projectModel = new ModelDouble('projects', ['status', 'name'], ['user']);
    let userModel = new ModelDouble('user', ['name']);
    let store = new StoreDouble({ 'project': projectModel, 'user': userModel });

    let rootField = new Type.Field('projects');
    let operation = new Type.Operation('query', 'projectsQuery', ArgumentSet.fromQuery({ status: 'active' }));

    this.parseTree = Parser.parse(projectModel, store, operation, rootField);
  }
});

test('makes the root of the tree an Operation', function(assert) {
  assert.equal(this.parseTree instanceof Type.Operation, true);
  assert.equal(this.parseTree.type, 'query');
  assert.equal(this.parseTree.name, 'projectsQuery');

  let rootSelectionSet = this.parseTree.selectionSet;
  assert.equal(rootSelectionSet instanceof Type.SelectionSet, true);
  assert.equal(rootSelectionSet.length, 1);
});

test('root field is generated in the selection set', function(assert){
  let rootField = this.parseTree.selectionSet[0];
  assert.equal(rootField instanceof Type.Field, true);
  assert.equal(rootField.name, 'projects');
});

test('there are as many elements in the selection set as there are top level fields', function(assert){
  let rootField = this.parseTree.selectionSet[0];
  let projectsSelectionSet = rootField.selectionSet;

  assert.equal(projectsSelectionSet.length, 3);
});

test('nested fields are generated in the root field selection set', function(assert){
  let rootField = this.parseTree.selectionSet[0];
  let projectsSelectionSet = rootField.selectionSet;
  let expectedStatusField = projectsSelectionSet[0];
  assert.equal(expectedStatusField instanceof Type.Field, true);
  assert.equal(expectedStatusField.name, 'status');

  let expectedNameField = projectsSelectionSet[1];
  assert.equal(expectedNameField instanceof Type.Field, true);
  assert.equal(expectedNameField.name, 'name');

  let expectedAuthorField = projectsSelectionSet[2];
  assert.equal(expectedAuthorField instanceof Type.Field, true);
  assert.equal(expectedAuthorField.name, 'user');
});