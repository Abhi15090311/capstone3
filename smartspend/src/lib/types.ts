// src/lib/types.ts

export type NWG = 'Need' | 'Want' | 'Guilt'
export type Mood = 'happy' | 'neutral' | 'impulse' | 'stressed' | 'sad'


export type Transaction = {
  id: string
  type: 'expense' | 'income'
  amount: number
  occurred_at: string // ISO
  merchant: string
  category: string
  nwg: NWG | null
  late_night: boolean
  mood: Mood | null
  note?: string
}

export type Bill = {
  id: string
  name: string
  amount: number
  cadence: 'monthly' | 'weekly' | 'bi-weekly' | string
  next_due: string // YYYY-MM-DD
  category: string
  nwg: NWG
}

export type Category = {
  id: string
  name: string
  nwg: NWG
}

export type Insight = {
  id: string
  type: string
  message: string
  severity: 'info' | 'warn' | 'error'
}

export type Achievement = {
  id: string
  name: string
  earned_at: string // YYYY-MM-DD
}
