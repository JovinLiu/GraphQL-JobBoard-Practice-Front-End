import { getAccessToken } from "../auth";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  concat,
  createHttpLink,
  gql,
} from "@apollo/client";

const httpLink = createHttpLink({
  uri: "http://localhost:9000/graphql",
});

const authLink = new ApolloLink((operation, forward) => {
  const token = getAccessToken();
  if (token) {
    operation.setContext({
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  return forward(operation);
});

export const apolloClinet = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    date
    title
    company {
      id
      name
    }
    description
  }
`;

export const companyByIdQuery = gql`
  query getCompanyById($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        date
        title
      }
    }
  }
`;

export const jobByIdQuery = gql`
  query getJobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export const jobsQuery = gql`
  query getJobs {
    jobs {
      id
      date
      title
      company {
        id
        name
      }
    }
  }
`;

export const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput!) {
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

// export async function createJob({ title, description }) {
//   const { data } = await apolloClinet.mutate({
//     mutation: createJobMutation,
//     variables: { input: { title, description } },
//     update: (cache, result) => {
//       cache.writeQuery({
//         query: jobByIdQuery,
//         variables: { id: result.data.job.id },
//         data: result.data,
//       });
//     },
//     //可以在这里传入第三个Argument来实现authentication
//     // context: {
//     //   headers: {}
//     // }
//   });
//   return data.job;
// }
// export async function getJob(id) {
//   const { data } = await apolloClinet.query({
//     query: jobByIdQuery,
//     variables: { id },
//   });
//   return data.job;
// }
// export async function getCompany(id) {
//   const { data } = await apolloClinet.query({
//     query: companyByIdQuery,
//     variables: { id },
//   });
//   return data.company;
// }
// export async function getJobs() {
//   const query = gql`
//     query getJobs {
//       jobs {
//         id
//         date
//         title
//         company {
//           id
//           name
//         }
//       }
//     }
//   `;
//   const { data } = await apolloClinet.query({
//     query,
//     // fetchPolicy: "cache-first", 可以在这里设置reinvalidate数据的设置， cache first表示缓存优先数据
//     fetchPolicy: "network-only", //总是获取最新的数据, network first表示数据库数据优先
//   });
//   return data.jobs;
// }
