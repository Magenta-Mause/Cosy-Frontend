import { defineConfig } from 'orval';

export default defineConfig({
  'backend-api': {
    input: './openapi-backend.json',
    output: {
      // 1. Tell Orval to generate React Query hooks
      client: 'react-query',
      // orval 8 defaults to `fetch`; the mutator below (customInstance) wraps axios.
      httpClient: 'axios',

      // 2. Output location
      target: './src/api/generated/backend-api.ts',

      schemas: './src/api/generated/model',

      // 4. Inject your custom instance to handle the "Wrapper"
      override: {
        mutator: {
          path: './src/api/axiosInstance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
