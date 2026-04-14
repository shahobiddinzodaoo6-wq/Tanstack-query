export interface IImage {
    id: number;
    imageName: string;
}

export interface IData {
    id: number;
    name: string;
    description: string;
    isCompleted: boolean;
    images: IImage[];
}

export interface IResponse {
    data: IData[];
}

export interface IAddTodo {
    name: string;
    description: string;
    images?: FileList;
}

export interface IEditTodo {
    id: number;
    name: string;
    description: string;
}
