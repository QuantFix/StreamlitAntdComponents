import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import '../css/utils.css'
import {useMantineTheme} from "@mantine/core";

const MartineFontSize = {
    'xs': 12,
    'sm': 14,
    'md': 16,
    'lg': 18,
    'xl': 20,
}
const MartineRadiusSize = {
    'xs': 2,
    'sm': 4,
    'md': 8,
    'lg': 16,
    'xl': 32,
}


const getSize = (size, base = MartineFontSize) => {
    if (['xs', 'sm', 'md', 'lg', 'xl'].indexOf(size) !== -1) {
        return base[size]
    } else {
        return size
    }
}


const GetColor = (color) => {
    const theme = useMantineTheme()
    if (color.indexOf('--') === 0) {
        return getRootColor(color)
    } else {
        if (Object.keys(theme.colors).indexOf(color) !== -1) {
            return theme.colors[color][6]
        } else {
            return color
        }
    }
}
const RgbaColor = (color, alpha = 0.2) => {
    const theme = useMantineTheme()
    return theme.fn.rgba(color, alpha)
}
const DarkenColor = (color, alpha = 0.2) => {
    const theme = useMantineTheme()
    return theme.fn.darken(color, alpha)
}

const linkTagSize = (x, new_default) => {
    let new_x = deepCopy(x)
    if (new_x.size === 'sm') {
        new_x.size = new_default
    }
    return new_x
}

const LabelWrap = ({label, desc, size = 'md', align = 'start', grow = false, children}) => {
    const textColor = GetColor('--text-color')
    return <div style={{display: grow ? 'block' : 'flex', justifyContent: align}}>
        {label !== null ?
            <div style={{display: 'flex', flexDirection: 'column', gap: 5, width: grow ? '100%' : 'unset'}}>
                <div style={{lineHeight: 1.3, fontFamily: 'var(--font)'}}>
                    <div style={{color: textColor, fontSize: getSize(size)}}>{label}</div>
                    <div style={{
                        color: RgbaColor(textColor, 0.5),
                        fontSize: getSize(size) - 2,
                        display: desc === null ? 'none' : 'block'
                    }}>{desc}</div>
                </div>
                {children}
            </div> : children}
    </div>
}


const markdown = (x) => {
    if (x !== null) {
        return <ReactMarkdown rehypePlugins={[rehypeRaw]}>{x}</ReactMarkdown>
    }
    return undefined
}

const deepCopy = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

const insertStyle = (id, style) => {
    let element = document.getElementById(id);
    if (!element) {
        element = document.createElement("style");
        element.id = id;
    }
    element.innerHTML = style;
    let root = document.getElementById("root");
    root && root.appendChild(element)
}

const StreamlitScrollbar = () => {
    const textColor = GetColor('--text-color')
    let scrollBarColor = RgbaColor(textColor, 0.4)
    let style = `
        ::-webkit-scrollbar {
            height: 6px;
            width: 6px;
            background-color: transparent;
        }
        ::-webkit-scrollbar-thumb {
            border-radius: 10px;
            background-color: ${scrollBarColor};
        }`
    //insert style
    insertStyle('streamlit-scrollbar', style)
}

const getRootColor = (varColor) => {
    const getColorComponents = (color) => {
        // Handle hexadecimal color format
        const hexMatch = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
        if (hexMatch.test(color)) {
            let hex = color.substring(1);
            if (hex.length === 3) {
                hex = hex.split('').map((char) => char + char).join('');
            }
            const [r, g, b] = hex.match(/.{2}/g).map((c) => parseInt(c, 16));
            return [r, g, b];
        }

        // Handle RGB and RGBA color formats
        const rgbMatch = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/;
        const match = color.match(rgbMatch);
        if (match) {
            const [_, r, g, b] = match.map(Number);
            return [r, g, b];
        }

        // Handle other color formats or invalid colors
        return null;
    };
    const color = getComputedStyle(document.documentElement).getPropertyValue(varColor).trim();
    const colorComponents = getColorComponents(color)
    if (colorComponents) {
        const [r, g, b] = colorComponents
        return `rgb(${r},${g},${b})`
    } else {
        return null
    }
}

const getCollapseKeys = (items) => {
    let keys = []

    const getKey = (obj) => {
        if (Array.isArray(obj)) {
            obj.map(obj_ => getKey(obj_))
        } else {
            if (obj.children) {
                obj.children.map((obj_) => getKey(obj_))
                keys.push(obj.key)
            }
        }
    }
    getKey(items)
    return keys
}

const getParentKeys = (keys, obj) => {
    const getParent = (k, obj) => {
        let allParentKeys = []
        //get one parent key
        const getParentKey = (key, tree) => {
            let parentKey;
            for (let i = 0; i < tree.length; i++) {
                const node = tree[i];
                if (node.children) {
                    if (node.children.some((item) => item.key === key)) {
                        parentKey = node.key;
                    } else if (getParentKey(key, node.children)) {
                        parentKey = getParentKey(key, node.children);
                    }
                }
            }
            return parentKey;
        }
        const getParentKey_ = (k, obj) => {
            let key = getParentKey(k, obj)
            if (key) {
                allParentKeys.push(key)
                getParentKey_(key, obj)
            }
        }
        getParentKey_(k, obj)
        return allParentKeys
    }
    let parentKeys = keys.map(k => getParent(k, obj))
    let parentKey = []
    for (let i = 0; i < parentKeys.length; i += 1) {
        let element = parentKeys[i]
        for (let j = 0; j < element.length; j += 1) {
            parentKey.push(element[j])
        }
    }
    return parentKey
}

const reindex = (index, asString = true, asArray = true) => {
    let r = index
    if (typeof (index) == 'number') {
        if (asArray) {
            r = [asString ? String(index) : index]
        } else {
            r = asString ? String(index) : index
        }
    }
    if (Array.isArray(index) && asString) {
        r = index.map(i => String(i))
    }
    return r
}

const getHrefKeys = (items) => {
    let keys = []

    const getKey = (obj) => {
        if (Array.isArray(obj)) {
            obj.map(obj_ => getKey(obj_))
        } else {
            if (obj.children) {
                obj.children.map((obj_) => getKey(obj_))
            }
            if (obj.href != null) {
                keys.push(obj.key)
            }
        }
    }
    getKey(items)
    return keys
}

const parseIcon = (obj) => {
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        return <i className={`bi bi-${obj['bs']} mx-1`}/>
    }
    return obj
}

export {
    deepCopy,
    StreamlitScrollbar,
    getCollapseKeys,
    getHrefKeys,
    getParentKeys,
    reindex,
    parseIcon,
    markdown,
    insertStyle,
    MartineFontSize,
    MartineRadiusSize,
    GetColor, RgbaColor, DarkenColor, LabelWrap, getSize, linkTagSize
}