import os
import shutil
from pathlib import Path

def format_size(size_bytes):
    """将字节大小转换为人类可读的格式"""
    if size_bytes < 1024:
        return f"{size_bytes}B"
    elif size_bytes < 1024*1024:
        return f"{size_bytes/1024:.2f}KB"
    else:
        return f"{size_bytes/(1024*1024):.2f}MB"

def copy_files_with_replace(source_files, destination_folder):
    """
    复制多个文件到指定目录，如果文件名相同则自动替换
    
    Args:
        source_files: 源文件路径列表
        destination_folder: 目标文件夹路径
    """
    # 确保目标文件夹存在
    destination_path = Path(destination_folder)
    destination_path.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    error_count = 0
    total_source_size = 0
    total_dest_size = 0
    
    for source_file in source_files:
        try:
            source_path = Path(source_file)
            
            # 检查源文件是否存在
            if not source_path.exists():
                print(f"❌ 源文件不存在: {source_file}")
                error_count += 1
                continue
            
            # 获取源文件大小
            source_size = source_path.stat().st_size
            total_source_size += source_size
            
            # 构建目标文件路径
            destination_file = destination_path / source_path.name
            
            # 记录目标文件原始大小（如果存在）
            orig_dest_size = destination_file.stat().st_size if destination_file.exists() else 0
            
            # 复制文件（如果存在同名文件会自动替换）
            shutil.copy2(source_file, destination_file)
            
            # 获取复制后的目标文件大小
            dest_size = destination_file.stat().st_size
            total_dest_size += dest_size
            
            # 计算大小变化
            size_change = dest_size - orig_dest_size
            change_symbol = "+" if size_change > 0 else ("-" if size_change < 0 else "")
            size_change_str = f"({format_size(orig_dest_size)} → {format_size(dest_size)})"
            if orig_dest_size > 0:
                size_change_str += f" [{change_symbol}{format_size(abs(size_change))}]"
            
            print(f"✅ 成功复制: {source_path.name} {size_change_str} -> {destination_folder}")
            success_count += 1
            
        except Exception as e:
            print(f"❌ 复制失败 {source_file}: {str(e)}")
            error_count += 1
    
    # 计算总大小变化
    total_change = total_dest_size - total_source_size
    change_symbol = "+" if total_change > 0 else ("-" if total_change < 0 else "")
    total_size_str = f"总大小: {format_size(total_source_size)} → {format_size(total_dest_size)}"
    if total_change != 0:
        total_size_str += f" [{change_symbol}{format_size(abs(total_change))}]"
    
    # 使用单行f-string避免多行缩进问题
    print(f"\n📊 复制完成! 成功: {success_count}, 失败: {error_count} | {total_size_str}")

# 存储多对文件路径配置
file_pairs = {
    "pair1": {
        "name": "Obsidian插件文件",
        "source_files": [
            r"C:\Desktop\code\obsidian-form-flow-master\plugin\manifest.json",
            r"C:\Desktop\code\obsidian-form-flow-master\plugin\main.js",
            r"C:\Desktop\code\obsidian-form-flow-master\plugin\styles.css"
        ],
        "target_folder": r"C:\Code\Obsidian沙箱仓库\.obsidian\plugins\form-flow"
    },
    "pair2": {
        "name": "主题",
        "source_files": [
            r"C:\Desktop\code\Lmmersive\manifest.json",
            r"C:\Desktop\code\Lmmersive\theme.css"
        ],
        "target_folder": r"C:\Code\Obsidian沙箱仓库\.obsidian\themes\Lmmersive"
    },
    "pair3": {
        "name": "Obsidian插件文件",
        "source_files": [
            r"C:\Desktop\code\git-auto\manifest.json",
            r"C:\Desktop\code\git-auto\main.js",
            r"C:\Desktop\code\git-auto\styles.css"
        ],
        "target_folder": r"C:\Code\Obsidian沙箱仓库\.obsidian\plugins\git-auto"
    }
    # 可以根据需要添加更多的文件对
}

def select_copy_mode():
    """
    让用户选择复制模式: 复制一对或复制所有
    """
    print("\n📋 请选择复制模式:")
    print("1. 复制特定一对文件")
    print("2. 复制所有文件对")
    
    while True:
        choice = input("请输入选项 (1/2): ").strip()
        if choice in ["1", "2"]:
            return int(choice)
        else:
            print("❌ 无效选项，请输入1或2。")


def select_file_pair():
    """
    让用户选择要复制的文件对
    """
    print("\n📋 可用文件对:")
    for i, (pair_id, pair_info) in enumerate(file_pairs.items(), 1):
        print(f"{i}. {pair_info['name']} (ID: {pair_id})")
    
    while True:
        try:
            choice = int(input("请输入要复制的文件对编号: ").strip())
            if 1 <= choice <= len(file_pairs):
                pair_ids = list(file_pairs.keys())
                return pair_ids[choice - 1]
            else:
                print(f"❌ 无效编号，请输入1到{len(file_pairs)}之间的数字。")
        except ValueError:
            print("❌ 无效输入，请输入数字。")


# 使用示例
if __name__ == "__main__":
    # 选择复制模式
    mode = select_copy_mode()
    
    if mode == 1:
        # 复制特定一对
        pair_id = select_file_pair()
        pair = file_pairs[pair_id]
        print(f"\n🚀 开始复制: {pair['name']}")
        copy_files_with_replace(pair['source_files'], pair['target_folder'])
    else:
        # 复制所有对
        print("\n🚀 开始复制所有文件对")
        total_success = 0
        total_error = 0
        
        for pair_id, pair in file_pairs.items():
            print(f"\n🔄 处理文件对: {pair['name']}")
            # 临时重定向输出，以便获取成功和失败计数
            import io
            import sys
            
            old_stdout = sys.stdout
            sys.stdout = captured_output = io.StringIO()
            
            copy_files_with_replace(pair['source_files'], pair['target_folder'])
            
            sys.stdout = old_stdout
            output = captured_output.getvalue()
            
            # 解析输出获取成功和失败计数
            for line in output.splitlines():
                if "成功: " in line and "失败: " in line:
                    parts = line.split()
                    success = int(parts[parts.index("成功:") + 1].replace(",", ""))
                    error = int(parts[parts.index("失败:") + 1].replace(",", ""))
                    total_success += success
                    total_error += error
                    break
        
        print(f"\n📊 所有文件对复制完成! 总成功: {total_success}, 总失败: {total_error}")
