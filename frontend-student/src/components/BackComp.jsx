import {useNavigate} from "react-router";
import {memo} from "react";

const BackComp = memo(() => {
    const nav = useNavigate();

    return (
        <div onClick={() => {
            nav(-1)
        }} className={'button btn-primary w-max-content rounded min-w-[25px]'}>
            ⟵
        </div>
    )
});

export default BackComp;