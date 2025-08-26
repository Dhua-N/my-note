import Dexie from 'dexie'

export interface Note {
  id: string
  title: string
  body: string
  createdAt: number
  updatedAt: number
  pinned?: number  // 置顶时间戳，用于排序
}

class MyDb extends Dexie {
  notes!: Dexie.Table<Note, string>

  constructor() {
    super('my-note-db')
    this.version(1).stores({
      notes: 'id, createdAt'   // 添加 createdAt 索引
    })
  }
}

export const db = new MyDb()