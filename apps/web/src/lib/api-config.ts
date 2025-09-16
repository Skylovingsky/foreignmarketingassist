// API配置
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://3001-ibr8pve55krqf22np4xrh-6532622b.e2b.dev',
  ENDPOINTS: {
    CUSTOMERS: '/api/customers',
    CUSTOMER_UPLOAD: '/api/customers/upload',
    CUSTOMER_IMPORT_CONFIRM: '/api/customers/import-confirm',
    COMPANY_ANALYZE: (id: string) => `/api/companies/${id}/analyze`,
    AGENT_CHAT: '/api/agent/chat',
    AGENT_HEALTH: '/api/agent/health'
  }
}

// API调用助手函数
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`API调用失败: ${response.status} ${response.statusText} - ${errorData}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API调用错误:', error)
    throw error
  }
}

// 文件上传助手函数
export const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CUSTOMER_UPLOAD}`, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`上传失败: ${response.status} ${response.statusText} - ${errorData}`)
  }
  
  return await response.json()
}