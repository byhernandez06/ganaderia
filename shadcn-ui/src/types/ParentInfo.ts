export interface ParentReference {
  id: string;
  tag?: string;
  name?: string;
}

export interface ParentInfo {
  father?: ParentReference | null;
  mother?: ParentReference | null;
  maternalGrandfather?: ParentReference | null;
  maternalGrandmother?: ParentReference | null;
  paternalGrandfather?: ParentReference | null;
  paternalGrandmother?: ParentReference | null;
}
