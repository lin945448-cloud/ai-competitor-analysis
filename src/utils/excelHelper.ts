import * as XLSX from 'xlsx';
import { NoteRecord } from '../types';

export const parseExcelFiles = async (files: File[]): Promise<NoteRecord[]> => {
  let allRecords: NoteRecord[] = [];

  for (const file of files) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json: any[] = XLSX.utils.sheet_to_json(sheet);

    const formatted = json.map(row => ({
      publishTime: String(row['笔记发布时间'] || ''),
      month: String(row['笔记发布时间'] || '').substring(0, 7), // 自动截取年月
      title: row['笔记标题'] || '',
      form: row['笔记形式'] || '',
      brand: row['报备合作品牌'] || '未知品牌',
      type: row['笔记类型'] || '',
      link: row['笔记链接'] || '',
      interactions: Number(row['互动量'] || 0),
      likes: Number(row['点赞'] || 0),
      comments: Number(row['评论'] || 0),
      saves: Number(row['收藏'] || 0),
      shares: Number(row['分享'] || 0),
      influencerName: row['达人昵称'] || '',
      fans: Number(row['粉丝数'] || 0),
      level: row['达人红薯等级'] || '',
      attribute: row['达人属性'] || '初级',
      tags: row['达人标签(前5)'] || '',
      cost: Number(row['预估投放金额'] || 0),
    }));
    allRecords = [...allRecords, ...formatted];
  }
  return allRecords;
};
