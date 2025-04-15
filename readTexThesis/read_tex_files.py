#!/usr/bin/env python3
import os
import sys
import re
import subprocess
import datetime
import json
from pathlib import Path
from shutil import which

def find_tex_files(directory):
    
    tex_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tex'):
                tex_files.append(os.path.join(root, file))
    return tex_files

def strip_tex_commands(text):
    
    # Remove comments
    text = re.sub(r'%.*?\n', '\n', text)
    
    # Remove LaTeX commands with arguments in curly braces
    text = re.sub(r'\\[a-zA-Z]+\*?(\{[^{}]*\}|\[[^\[\]]*\])*', ' ', text)
    
    # Remove standalone LaTeX commands
    text = re.sub(r'\\[a-zA-Z]+\*?', ' ', text)
    
    # Remove curly braces
    text = re.sub(r'\{|\}', '', text)
    
    # Remove square brackets
    text = re.sub(r'\[|\]', '', text)
    
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'^\s+|\s+$', '', text, flags=re.MULTILINE)
    
    return text

def create_output_directory(base_dir=None):
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir_name = f"output_{timestamp}"
    
    # If base_dir is provided, create the output directory inside it
    if base_dir:
        output_dir = os.path.join(base_dir, output_dir_name)
    else:
        output_dir = output_dir_name
        
    os.makedirs(output_dir, exist_ok=True)
    print(f"Created output directory: {output_dir}")
    return output_dir

def convert_with_pandoc(file_path, output_path):
    
    try:
        # Create parent directories if they don't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        process = subprocess.run(
            ['pandoc', file_path, '-o', output_path, '--wrap=none'],
            capture_output=True,
            text=True
        )
        
        if process.returncode == 0 and os.path.exists(output_path):
            return True
        else:
            print(f"Pandoc conversion failed: {process.stderr}")
            return False
    except Exception as e:
        print(f"Error using pandoc: {e}")
        return False

def convert_with_regex(file_path, output_path):
    
    try:
        # Create parent directories if they don't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Read the .tex file
        with open(file_path, 'r', encoding='utf-8') as f:
            tex_content = f.read()
        
        # Strip LaTeX commands
        txt_content = strip_tex_commands(tex_content)
        
        # Write to output file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(txt_content)
        
        return True
    except Exception as e:
        print(f"Error with regex conversion: {e}")
        return False

def convert_tex_to_txt(file_path, base_dir, output_dir):
    
    try:
        # Determine the relative path from the base directory
        rel_path = os.path.relpath(file_path, base_dir)
        
        # Create the output path
        output_path = os.path.join(output_dir, rel_path)
        output_path = os.path.splitext(output_path)[0] + '.txt'
        
        print(f"Converting: {file_path}")
        print(f"To: {output_path}")
        
        # Check if pandoc is available
        pandoc_available = which('pandoc') is not None
        
        success = False
        
        # Try pandoc first if available
        if pandoc_available:
            print("Using pandoc for conversion...")
            success = convert_with_pandoc(file_path, output_path)
        
        # Fall back to regex method if pandoc fails or isn't available
        if not success:
            if not pandoc_available:
                print("Pandoc not found, using regex-based conversion...")
            else:
                print("Pandoc conversion failed, falling back to regex-based conversion...")
            
            success = convert_with_regex(file_path, output_path)
        
        if success:
            print(f"Successfully converted: {output_path}")
            return output_path
        else:
            print(f"Failed to convert {file_path}")
            return None
    except Exception as e:
        print(f"Error during conversion of {file_path}: {e}")
        return None

def parse_sections(text_content):
    
    # Regular expressions for different heading levels
    heading_patterns = [
        (1, re.compile(r'^# (.+?)(\s+\{[^}]*\})?$', re.MULTILINE)),      # Chapter
        (2, re.compile(r'^## (.+?)(\s+\{[^}]*\})?$', re.MULTILINE)),     # Section
        (3, re.compile(r'^### (.+?)(\s+\{[^}]*\})?$', re.MULTILINE)),    # Subsection
        (4, re.compile(r'^#### (.+?)(\s+\{[^}]*\})?$', re.MULTILINE)),   # Subsubsection
    ]
    
    # Find all headings with their positions
    headings_with_pos = []
    for level, pattern in heading_patterns:
        for match in pattern.finditer(text_content):
            heading_text = match.group(1).strip()
            position = match.start()
            headings_with_pos.append((level, heading_text, position))
    
    # Sort headings by position
    headings_with_pos.sort(key=lambda x: x[2])
    
    # If no headings found, return the entire content as a single block
    if not headings_with_pos:
        return {
            "title": "Untitled",
            "level": 0,
            "content": text_content.strip(),
            "sections": []
        }
    
    # Build the hierarchical structure
    root = {
        "title": "Root",
        "level": 0,
        "content": "",
        "sections": []
    }
    
    # Recursive function to build the hierarchy
    def build_hierarchy(current_headings, parent_level, start_pos, end_pos):
        if not current_headings:
            # Extract content between start_pos and end_pos
            content = text_content[start_pos:end_pos].strip()
            return [], content
        
        level, title, pos = current_headings[0]
        
        # If the heading is at a higher level than parent, skip it
        if level <= parent_level:
            return current_headings, ""
        
        # Current section's content starts after the heading
        section_start = pos + len(title) + 2  # +2 for the "# " prefix
        
        # Find the end of this section's content
        section_end = end_pos
        remaining_headings = current_headings[1:]
        sections = []
        
        # Process child headings
        while remaining_headings:
            next_level, next_title, next_pos = remaining_headings[0]
            
            # If next heading is a subsection of current
            if next_level > level:
                remaining_headings, subsection = build_hierarchy(
                    remaining_headings, level, section_start, section_end
                )
                sections.append(subsection)
            # If next heading is a sibling or higher level
            else:
                section_end = next_pos
                break
        
        # Extract content for this section (excluding subsection content)
        content = text_content[section_start:section_end].strip()
        
        # Clean content - remove embedded heading lines
        content_lines = content.split('\n')
        clean_lines = []
        for line in content_lines:
            is_heading = False
            for _, pattern in heading_patterns:
                if pattern.match(line):
                    is_heading = True
                    break
            if not is_heading:
                clean_lines.append(line)
        
        clean_content = '\n'.join(clean_lines).strip()
        
        current_section = {
            "title": title,
            "level": level,
            "content": clean_content,
            "sections": sections
        }
        
        return remaining_headings, current_section
    
    # Process all headings
    remaining = headings_with_pos
    sections = []
    while remaining:
        remaining, section = build_hierarchy(remaining, 0, 0, len(text_content))
        sections.append(section)
    
    # If there's only one top-level section, return it directly
    if len(sections) == 1:
        return sections[0]
    
    # Otherwise, return all sections under the root
    root["sections"] = sections
    return root

def extract_structured_content(txt_file_path, output_dir):
    
    try:
        with open(txt_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse structure
        structured_content = parse_sections(content)
        
        # Create output JSON path
        json_path = os.path.splitext(txt_file_path)[0] + '.json'
        
        # Save JSON
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(structured_content, f, indent=2)
        
        print(f"Created structured JSON: {json_path}")
        return json_path
    except Exception as e:
        print(f"Error extracting structure from {txt_file_path}: {e}")
        return None

def process_tex_files(directory, base_dir=None):
    
    # Create timestamped output directory
    output_dir = create_output_directory(base_dir)
    
    # Find all .tex files
    tex_files = find_tex_files(directory)
    
    if not tex_files:
        print(f"No .tex files found in {directory}")
        return
    
    print(f"Found {len(tex_files)} .tex files:")
    
    # Convert each file
    converted_files = []
    json_files = []
    for file_path in tex_files:
        txt_path = convert_tex_to_txt(file_path, directory, output_dir)
        if txt_path:
            converted_files.append(txt_path)
            # Print a preview of the converted text
            with open(txt_path, 'r', encoding='utf-8') as f:
                preview = f.read(200)
            print(f"Preview: {preview}...")
            
            # Extract structured content
            json_path = extract_structured_content(txt_path, output_dir)
            if json_path:
                json_files.append(json_path)
    
    # Summary
    if converted_files:
        print(f"\nSuccessfully converted {len(converted_files)} out of {len(tex_files)} .tex files to .txt format.")
        print(f"Created {len(json_files)} structured JSON files.")
        print(f"All files are organized in: {output_dir}")
    else:
        print("\nNo .tex files were successfully converted.")
    
    return output_dir

def main():
    # Default to 'data' directory if no directory is provided
    data_dir = 'data'
    base_dir = None
    
    # Parse arguments
    if len(sys.argv) > 1:
        data_dir = sys.argv[1]
    
    # Check if base directory is provided
    if len(sys.argv) > 2:
        base_dir = sys.argv[2]
    
    data_path = Path(data_dir)
    if not data_path.exists() or not data_path.is_dir():
        print(f"Error: {data_dir} does not exist or is not a directory")
        sys.exit(1)
    
    process_tex_files(data_dir, base_dir)

if __name__ == "__main__":
    main() 