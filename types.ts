
export interface ContactRecord {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface AppState {
  data: ContactRecord[];
  selectedIds: Set<string>;
}
