export interface NoteRecord {
  publishTime: string;  // 笔记发布时间
  month: string;        // 提取出的月份
  title: string;        // 笔记标题
  form: string;         // 笔记形式
  brand: string;        // 报备合作品牌
  type: string;         // 笔记类型
  link: string;         // 笔记链接
  interactions: number; // 互动量
  likes: number;        // 点赞
  comments: number;     // 评论
  saves: number;        // 收藏
  shares: number;       // 分享
  influencerName: string; // 达人昵称
  fans: number;         // 粉丝数
  level: string;        // 达人红薯等级
  attribute: string;    // 达人属性 (头部/腰部/初级)
  tags: string;         // 达人标签
  cost: number;         // 预估投放金额
}
