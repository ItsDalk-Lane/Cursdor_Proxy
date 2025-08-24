import { AbstractInputSuggest, TFolder, App } from "obsidian";
import { advancedSearch, highlightMatches } from "../../utils/searchUtils";

export default class extends AbstractInputSuggest<TFolder> {
    private currentQuery: string = "";
    
    constructor(public app: App, textInputEl: HTMLInputElement) {
        super(app, textInputEl);
    }

    protected getSuggestions(query: string): TFolder[] | Promise<TFolder[]> {
        this.currentQuery = query || "";
        const folders = this.app.vault
            .getAllLoadedFiles()
            .filter((f) => f instanceof TFolder) as TFolder[];
            
        // 使用高级搜索算法
        const searchResults = advancedSearch(
            folders,
            query || "",
            (f) => f.path,
            50
        );
        
        return searchResults.map(result => result.item);
    }
    
    renderSuggestion(value: TFolder, el: HTMLElement): void {
        // 如果有搜索查询，高亮显示匹配的文本
        if (this.currentQuery && this.currentQuery.trim() !== '') {
            const folders = this.app.vault
                .getAllLoadedFiles()
                .filter((f) => f instanceof TFolder) as TFolder[];
                
            const searchResults = advancedSearch(
                folders,
                this.currentQuery,
                (f) => f.path,
                50
            );
            
            const matchedResult = searchResults.find(result => result.item.path === value.path);
            if (matchedResult && matchedResult.matchedIndices.length > 0) {
                const highlightedText = highlightMatches(value.path, matchedResult.matchedIndices);
                el.innerHTML = highlightedText;
                return;
            }
        }
        
        el.setText(value.path);
    }
}