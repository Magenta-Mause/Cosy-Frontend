import {useCursorify} from "@cursorify/react";
import defaultCursor from "@/assets/ai-generated/cursor/cursor-default.png";
import pointerCursor from "@/assets/ai-generated/cursor/cursor-pointer.png";

const CustomCursor = () => {
    const {mouseState, style} = useCursorify()

    return (
        <div style={{width: 40, height: 40,}}>
            🖐️
        </div>
    )
}

export default CustomCursor;