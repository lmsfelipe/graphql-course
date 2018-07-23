const graphql = require('graphql');
const axios = require('axios');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema
} = graphql;

/**
 * Diz ao graphql o conteúdo e tipo do seu schema
 * No 'company' do UserType, faz uma relação com CompanyType, dizendo que
 * o type é igual ao CompanyType e chamando o resolve() com argumento parentValue, onde
 * recebe os valores do 'user' que então é passado o 'id' na requisição.
 *  {
 *   user(id: "47") {
 *     id,
 *     firstName,
 *     age,
 *     company {
 *      id,
 *      name,
 *      description 
 *     }
 *   }
 *  }
 */
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString }
  }
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(resp => resp.data);
      }
    }
  }
});

/**
 * RootQuery é necessário para direcionar o graphql para o dado solicitado
 * Ponto de entrada dos dados
 * { user: {args} } - Se está procurando 'user' e passa id, ele retorna o usuário
 * resolve() - Retorna os dados que está procurando - Sempre retornar objeto ou json
 * {
 *   user(id: "47") {
 *     id,
 *     firstName,
 *     age
 *   }
 * }
 */
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/users/${args.id}`)
          .then(resp => resp.data);
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`)
          .then(resp => resp.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});
