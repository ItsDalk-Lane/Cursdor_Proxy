import { App, SuggestModal, TFile } from "obsidian";
import "./CFormSuggestModal.css";
import { localInstance } from "src/i18n/locals";
import { advancedSearch, highlightMatches } from "../../utils/searchUtils";

export default class extends SuggestModal<TFile> {
	emptyStateText: string = localInstance.none;

	onChoose: (path: TFile) => void;

	tabEventHandler: (evt: KeyboardEvent) => void;

	constructor(app: App, onChoose: (path: TFile) => void) {
		super(app);
		this.onChoose = onChoose;
	}

	getSuggestions(query: string): TFile[] | Promise<TFile[]> {
		const items = this.getItems();
		
		// 使用高级搜索算法
		const searchResults = advancedSearch(
			items,
			query || "",
			(item) => item.basename,
			100
		);

		this.tabEventHandler = (evt) => {
			if (evt.key === "Tab") {
				// select .form--CpsFormSuggestionItem.is-selected
				const selected = this.containerEl.querySelector(
					".form--CpsFormSuggestionItem.is-selected"
				);
				if (selected) {
					const filePath = (selected as HTMLElement).dataset.filePath;
					if (filePath) {
						evt.preventDefault();
						evt.stopPropagation();
						this.app.workspace.openLinkText(filePath, "", true);
						this.close();
					}
				}
			}
		};
		return searchResults.map(result => result.item);
	}

	onOpen(): void {
		super.onOpen();
		this.containerEl.addEventListener("keydown", this.tabEventHandler);
	}

	onClose(): void {
		super.onClose();
		this.containerEl.removeEventListener("keydown", this.tabEventHandler);
	}

	renderSuggestion(value: TFile, el: HTMLElement) {
		const name = value.basename;
		el.addClass("form--CpsFormSuggestionItem");
		el.setAttribute("data-file-path", value.path);
		
		// 获取当前搜索查询
		const query = this.inputEl.value;
		let displayName = name;
		
		// 如果有搜索查询，高亮显示匹配的文本
		if (query && query.trim() !== '') {
			const items = this.getItems();
			const searchResults = advancedSearch(
				items,
				query,
				(item) => item.basename,
				100
			);
			
			const matchedResult = searchResults.find(result => result.item.path === value.path);
			if (matchedResult && matchedResult.matchedIndices.length > 0) {
				displayName = highlightMatches(name, matchedResult.matchedIndices);
				el.createSpan().innerHTML = displayName;
			} else {
				el.createSpan({ text: name });
			}
		} else {
			el.createSpan({ text: name });
		}

		const menusEl = el.createDiv({
			cls: "form--CpsFormSuggestionItemMenus",
		});
		const enterEl = menusEl.createDiv({
			text: "↵",
			cls: "form--CpsFormSuggestionItemMenu",
		});
		enterEl.setAttribute("aria-label", "Open Form in modal");

		const openFileEl = menusEl.createDiv({
			text: "Tab",
			cls: "form--CpsFormSuggestionItemMenu",
		});
		openFileEl.setAttribute("aria-label", "Open File in new tab");
		openFileEl.onclick = (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.app.workspace.openLinkText(value.path, "", true);
			this.close();
		};
	}

	onChooseSuggestion(item: TFile, evt: MouseEvent | KeyboardEvent) {
		this.onChoose(item);
	}

	getItems(): TFile[] {
		return this.app.vault
			.getAllLoadedFiles()
			.filter(
				(f) => f instanceof TFile && f.extension === "cform"
			) as TFile[];
	}

	getItemText(item: string): string {
		return item;
	}
}
