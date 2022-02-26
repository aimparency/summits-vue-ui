import ColorHash from 'color-hash'; 

const colorHash = new ColorHash({ lightness: 0.4 }); 

export function nodeColor(nodeId: string) {
  return colorHash.hex(nodeId); 
}

export const NODE_COLORS = {
  unloaded: '#444', 
  unpublished: '#888', 
  selected: '#ccc'
}
