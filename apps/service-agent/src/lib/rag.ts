import type { RAGQuery, RAGResponse, RAGDocument } from '@trade-assistant/dto';

// RAG检索系统占位实现
// 后续可以集成向量数据库如pgvector、Qdrant等
export class RAGService {
  private mockDocuments: RAGDocument[] = [
    {
      id: '1',
      content: '外贸业务中，开发信的成功率通常在1-3%之间。个性化的开发信比群发邮件效果要好5-10倍。',
      metadata: {
        title: '开发信最佳实践',
        source: 'trade_best_practices',
        section: 'email_marketing',
        tags: ['开发信', '邮件营销', '外贸'],
      },
    },
    {
      id: '2', 
      content: '客户跟进的黄金时间是首次接触后的24-48小时内。超过一周未跟进的客户，响应率会下降60%以上。',
      metadata: {
        title: '客户跟进策略',
        source: 'sales_handbook',
        section: 'follow_up',
        tags: ['客户跟进', '销售', '时间管理'],
      },
    },
    {
      id: '3',
      content: 'LinkedIn是B2B外贸开发的重要渠道。活跃的LinkedIn档案可以增加30%的商业机会。',
      metadata: {
        title: 'LinkedIn营销指南',
        source: 'social_media_guide',
        section: 'linkedin',
        tags: ['LinkedIn', '社交媒体', 'B2B营销'],
      },
    },
  ];

  async query(query: RAGQuery): Promise<RAGResponse> {
    // 占位实现：简单的关键词匹配
    // 生产环境中应该使用向量搜索
    const keywords = query.query.toLowerCase().split(' ');
    const results = this.mockDocuments
      .map(doc => {
        let score = 0;
        const content = doc.content.toLowerCase();
        const title = doc.metadata.title?.toLowerCase() || '';
        const tags = doc.metadata.tags?.map(tag => tag.toLowerCase()) || [];
        
        keywords.forEach(keyword => {
          if (content.includes(keyword)) score += 2;
          if (title.includes(keyword)) score += 3;
          if (tags.some(tag => tag.includes(keyword))) score += 1;
        });
        
        return { ...doc, score };
      })
      .filter(doc => doc.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit || 5);

    return {
      documents: results,
      query: query.query,
      totalResults: results.length,
    };
  }

  async addDocument(document: Omit<RAGDocument, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    this.mockDocuments.push({ ...document, id });
    return id;
  }

  async updateDocument(id: string, document: Partial<RAGDocument>): Promise<boolean> {
    const index = this.mockDocuments.findIndex(doc => doc.id === id);
    if (index === -1) return false;
    
    this.mockDocuments[index] = { ...this.mockDocuments[index], ...document };
    return true;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const index = this.mockDocuments.findIndex(doc => doc.id === id);
    if (index === -1) return false;
    
    this.mockDocuments.splice(index, 1);
    return true;
  }
}