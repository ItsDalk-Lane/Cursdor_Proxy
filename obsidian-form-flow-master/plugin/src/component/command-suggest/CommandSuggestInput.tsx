import { Popover as RadixPopover } from "radix-ui";
import { useMemo, useState, useRef, useEffect } from "react";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { Strings } from "src/utils/Strings";

export function CommandSuggestInput(props: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    const { value, onChange } = props;
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const contentRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const app = useObsidianApp();

    const items = useMemo(() => {
        // 获取所有注册的命令
        const commands = Object.values(app.commands.commands);
        
        return commands
            .filter((command) => {
                if (value === "") {
                    return true;
                }
                const searchValue = Strings.safeToLowerCaseString(value);
                const commandId = Strings.safeToLowerCaseString(command.id);
                const commandName = Strings.safeToLowerCaseString(command.name || "");
                
                return commandId.includes(searchValue) || commandName.includes(searchValue);
            })
            .slice(0, 50) // 限制显示数量
            .map((command) => ({
                id: command.id,
                value: command.id,
                label: command.name || command.id,
                commandId: command.id,
            }));
    }, [value, app.commands.commands]);

    // 滚动到活跃项
    useEffect(() => {
        if (activeIndex >= 0 && activeIndex < items.length && listRef.current) {
            const activeItemId = items[activeIndex].id;
            const activeItem = listRef.current.querySelector(
                `[data-id="${activeItemId}"]`
            );

            if (activeItem) {
                activeItem.scrollIntoView({
                    block: "nearest",
                    inline: "nearest",
                });
            }
        }
    }, [activeIndex, items]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // is composing
        if (event.nativeEvent.isComposing) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((prevIndex) =>
                prevIndex < items.length - 1 ? prevIndex + 1 : 0
            );
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : items.length - 1
            );
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (activeIndex >= 0 && activeIndex < items.length) {
                const selectedItem = items[activeIndex];
                onChange(selectedItem.value);
            }
            setOpen(false);
        } else if (event.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <RadixPopover.Root open={open} onOpenChange={setOpen}>
            <RadixPopover.Trigger asChild>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        onChange(newValue);
                        if (!open && newValue.length > 0) {
                            setOpen(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setOpen(true)}
                    placeholder={props.placeholder || "输入命令ID或名称..."}
                    style={{ width: "100%" }}
                />
            </RadixPopover.Trigger>
            <RadixPopover.Portal
                container={window.activeWindow?.activeDocument?.body || document.body}
            >
                <RadixPopover.Content
                    className="form--CommandSuggestContent"
                    sideOffset={4}
                    collisionPadding={{
                        left: 16,
                        right: 16,
                        top: 8,
                        bottom: 8,
                    }}
                    ref={contentRef}
                    style={{
                        backgroundColor: "var(--background-primary)",
                        border: "1px solid var(--background-modifier-border)",
                        borderRadius: "8px",
                        padding: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        maxHeight: "300px",
                        minWidth: "300px",
                        zIndex: 1000,
                    }}
                >
                    <div
                        className="form--CommandSuggestList"
                        ref={listRef}
                        style={{
                            maxHeight: "280px",
                            overflowY: "auto",
                        }}
                    >
                        {items.length === 0 ? (
                            <div
                                style={{
                                    padding: "8px 12px",
                                    color: "var(--text-muted)",
                                    textAlign: "center",
                                }}
                            >
                                未找到匹配的命令
                            </div>
                        ) : (
                            items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="form--CommandSuggestItem"
                                    data-highlighted={activeIndex === index ? "true" : "false"}
                                    data-id={item.id}
                                    onClick={() => {
                                        onChange(item.value);
                                        setOpen(false);
                                    }}
                                    style={{
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                        borderRadius: "4px",
                                        backgroundColor: activeIndex === index ? "var(--background-modifier-hover)" : "transparent",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2px",
                                    }}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    <div style={{ fontWeight: "500", fontSize: "14px" }}>
                                        {item.label}
                                    </div>
                                    <div style={{ 
                                        fontSize: "12px", 
                                        color: "var(--text-muted)",
                                        fontFamily: "var(--font-monospace)",
                                    }}>
                                        {item.commandId}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </RadixPopover.Content>
            </RadixPopover.Portal>
        </RadixPopover.Root>
    );
}
