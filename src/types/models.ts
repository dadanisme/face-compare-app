export interface Parent {
  id: string;
  name: string;
  images: string[];
  phone: string;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  parentId: string;
}
