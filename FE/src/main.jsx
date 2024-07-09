import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { QueryClientProvider, QueryClient } from 'react-query' // Import the QueryClient class

const queryClient = new QueryClient() // Create a new instance of the QueryClient class
ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
        </React.StrictMode>
)
