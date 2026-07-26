export interface Photo {
  id: string
  filename: string
  thumb: string
  owner_id: string
  created_at: number
  size?: number
  taken_at?: string | null
}