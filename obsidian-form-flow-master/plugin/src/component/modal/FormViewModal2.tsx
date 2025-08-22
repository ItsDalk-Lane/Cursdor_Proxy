import { App } from "obsidian";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ObsidianAppContext } from "src/context/obsidianAppContext";
import { FormConfig } from "src/model/FormConfig";
import { CpsFormDataView } from "src/view/preview/CpsFormDataView";
import { CpsFormFileView } from "src/view/preview/CpsFormFileView";
import { FormStateManager } from "src/service/FormStateManager";
import Dialog2 from "../dialog/Dialog2";
import "./FormViewModal.css";

export default class FormViewModal2 {
	private isOpen = false;
	private containerEl: HTMLElement | null = null;
	private root: any = null; // React根节点引用
	private source: {
		formFilePath?: string;
		formConfig?: FormConfig;
		prefilledData?: Map<string, any>;
	};

	constructor(
		public app: App,
		source: {
			formFilePath?: string;
			formConfig?: FormConfig;
			prefilledData?: Map<string, any>;
		}
	) {
		this.source = source;
		
		// 调试信息：记录FormViewModal2构造函数参数
		if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
			console.log('[FormViewModal2] 构造函数调用');
			console.log('[FormViewModal2] formFilePath:', source.formFilePath);
			console.log('[FormViewModal2] formConfig:', source.formConfig);
			console.log('[FormViewModal2] prefilledData:', source.prefilledData);
			console.log('[FormViewModal2] prefilledData 是否存在:', !!source.prefilledData);
			console.log('[FormViewModal2] prefilledData 大小:', source.prefilledData ? source.prefilledData.size : 0);
			if (source.prefilledData && source.prefilledData.size > 0) {
				console.log('[FormViewModal2] prefilledData 内容:');
				source.prefilledData.forEach((value, key) => {
					console.log(`  ${key}:`, value);
				});
			}
		}
	}

	async open() {
		if (this.isOpen) return;
		this.isOpen = true;

		// Create container element for the dialog
		this.containerEl = document.createElement("div");
		this.containerEl.className = "form--FormViewModal2Container";
		document.body.appendChild(this.containerEl);

		// Create React root and save reference for proper cleanup
		this.root = createRoot(this.containerEl);

		// Render the FormModalContent component
		this.root.render(
			<StrictMode>
				<FormModalContent
					app={this.app}
					source={this.source}
					onClose={() => {
						this.cleanup();
					}}
				/>
			</StrictMode>
		);
	}

	/**
	 * 清理资源，防止内存泄漏
	 */
	private cleanup() {
		this.isOpen = false;
		
		// 清除表单状态
		FormStateManager.getInstance('FormStateManager').clearCurrentForm();
		
		// 延迟清理，确保React组件有时间完成卸载
		setTimeout(() => {
			try {
				// 卸载React根节点
				if (this.root) {
					this.root.unmount();
					this.root = null;
				}
				
				// 移除DOM元素
				if (this.containerEl) {
					this.containerEl.remove();
					this.containerEl = null;
				}
			} catch (error) {
				console.error('[FormViewModal2] 清理资源时发生错误:', error);
			}
		}, 0);
	}

	close() {
		if (this.containerEl) {
			// Trigger React unmount through a state change in the component
			const event = new CustomEvent("formmodal-close");
			this.containerEl.dispatchEvent(event);
		}
		this.cleanup();
	}
}

// React component for the modal content
function FormModalContent({
	app,
	source,
	onClose,
}: {
	app: App;
	source: {
		formFilePath?: string;
		formConfig?: FormConfig;
		prefilledData?: Map<string, any>;
	};
	onClose: () => void;
}) {
	// 调试信息：记录FormModalContent组件初始化
	if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
		console.log('[FormModalContent] 组件初始化');
		console.log('[FormModalContent] source:', source);
		console.log('[FormModalContent] prefilledData:', source.prefilledData);
	}
	
	const [open, setOpen] = useState(true);
	const [title, setTitle] = useState<string | undefined>(undefined);
	const [formConfig, setFormConfig] = useState<FormConfig | undefined>(
		source.formConfig
	);

	// Effect to handle closing
	useEffect(() => {
		if (!open) {
			onClose();
		}
	}, [open, onClose]);

	// Load form config from file if needed
	useEffect(() => {
		async function loadFormFromFile() {
			if (!source.formFilePath) return;

			try {
				const jsonObj = await app.vault.readJson(source.formFilePath);
				if (jsonObj) {
					const config = jsonObj as FormConfig;
					setFormConfig(config);
					
					// 设置当前活动表单到状态管理器
					FormStateManager.getInstance('FormStateManager').setCurrentForm(config);

					// Set title based on file name
					const fileBaseName = source.formFilePath.split("/").pop();
					setTitle(fileBaseName);
				}
			} catch (error) {
				console.error("Failed to load form config", error);
			}
		}

		if (source.formFilePath && !formConfig) {
			loadFormFromFile();
		}
	}, [source.formFilePath, formConfig]);

	// 设置表单配置到状态管理器
	useEffect(() => {
		if (formConfig) {
			FormStateManager.getInstance('FormStateManager').setCurrentForm(formConfig);
		}
	}, [formConfig]);

	if (!formConfig && !source.formFilePath) {
		return null;
	}

	// 调试信息：记录渲染前的状态
	if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
		console.log('[FormModalContent] 准备渲染');
		console.log('[FormModalContent] formConfig:', formConfig);
		console.log('[FormModalContent] 将使用的视图:', source.formFilePath && title && formConfig ? 'CpsFormFileView' : formConfig ? 'CpsFormDataView' : 'null');
		console.log('[FormModalContent] 传递给子组件的 prefilledData:', source.prefilledData);
	}
	
	return (
		<Dialog2
			open={open}
			onOpenChange={setOpen}
			title={title}
			dialogClassName="form--CpsFormModal"
		>
			{(close) => (
				<ObsidianAppContext.Provider value={app}>
					{source.formFilePath && title && formConfig ? (
						<>
							<CpsFormFileView
								className="form--CpsFormModalContent"
								filePath={source.formFilePath}
								formConfig={formConfig}
								prefilledData={source.prefilledData}
								options={{
									hideHeader: true,
									showFilePath: true,
									afterSubmit: () => close(),
								}}
							/>
						</>
					) : formConfig ? (
						<CpsFormDataView
							className="form--CpsFormModalContent"
							formConfig={formConfig}
							prefilledData={source.prefilledData}
							options={{
								afterSubmit: () => close(),
							}}
						/>
					) : null}
				</ObsidianAppContext.Provider>
			)}
		</Dialog2>
	);
}
