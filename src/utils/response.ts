export interface ResSuccess {
    status: number;
    content: any;
    fileName?: string;
}

export const resSuccess = (status: number, content: any): ResSuccess => {
    return { status, content };
};