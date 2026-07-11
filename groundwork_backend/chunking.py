def chunk_document(text, parent_size=1500, child_size=200, child_overlap=50):
    step = child_size - child_overlap
    parent_chunks = []
    i = 0
    parent_num = 0
    while i < len(text):
        end = i + parent_size
        piece = text[i:end]
        parent_id = f"p{parent_num}"
        children = []
        j = 0
        child_num = 0
        while j < len(piece):
            child_end = j + child_size
            child_text = piece[j:child_end]
            children.append({
                "child_id": f"{parent_id}_c{child_num}",
                "child_text": child_text,
                "parent_id": parent_id
            })
            j = j + step
            child_num = child_num + 1
        parent_chunks.append({
            "parent_id": parent_id,
            "parent_text": piece,
            "children": children
        })
        i = i + parent_size
        parent_num = parent_num + 1
    return parent_chunks