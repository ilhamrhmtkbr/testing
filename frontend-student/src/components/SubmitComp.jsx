import {memo} from "react";

const SubmitComp = memo((props) => {
    let name = 'Submit';

    if (props.name) {
        name = props.name;
    }

    const isCenter = props.isCenter ?? false;

    return (
        props.isLoading ?
            <div className={`button bg-primary py-[5px] px-[3px] min-h-[37px] ${isCenter ? 'ps-center' : ''}`}>
                <div className={'loading-spinner w-4 h-4'}
                     style={{
                         borderTopColor: 'white',
                     }}></div>
            </div>
            :
            <button className={`button bg-primary ${isCenter ? 'ps-center' : ''}`} type={'submit'}>{name}</button>
    )
})

export default SubmitComp;