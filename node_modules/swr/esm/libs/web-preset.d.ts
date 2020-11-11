declare function isOnline(): boolean;
declare function isDocumentVisible(): boolean;
declare const _default: {
    isOnline: typeof isOnline;
    isDocumentVisible: typeof isDocumentVisible;
    fetcher: (url: any) => Promise<any>;
};
export default _default;
