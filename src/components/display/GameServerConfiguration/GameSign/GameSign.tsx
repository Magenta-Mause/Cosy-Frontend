import signImage from "@/assets/ai-generated/main-page/sign.png";
import type {ReactNode} from "react";
import {cn} from "@/lib/utils.ts";

const GameSign = (props: { children: ReactNode, className?: string, classNameTextChildren?: string }) => {
    return <div
        className={cn("absolute  h-auto aspect-square", props.className)}
        style={{
            backgroundImage: `url(${signImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
        }}>
        <div
            className={cn("relative top-[25%] left-[12%] w-[70%] h-[45%] text-center text-amber-950 text-ellipsis overflow-y-hidden select-none", props.classNameTextChildren)}
            style={{fontSize: '.8vw'}}>
            {props.children}
        </div>
    </div>
}

export default GameSign;