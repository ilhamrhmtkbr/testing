import {memo} from "react";
import {formatNumber} from "../utils/Helper.js";

const CourseCardComp = memo(({children, title, image, price, editor, instructor}) => {
    return (
        <article className={'border-style-default radius-m grid grid-rows-[212px_1fr] max-w-[500px]'}>
            <img src={import.meta.env.VITE_APP_IMAGE_COURSE_URL + image}
                 className={'radius-s object-fit-cover w-full h-[-webkit-fill-available]'}
                 alt={title}/>
            <div className={'box-border p-m grid grid-rows-[1fr_max-content_max-content]'}>
                <p className={'font-bold font-size-l'}>{title}</p>
                <p className={'text-link font-size-s font-medium'}>{instructor}</p>
                <p className={'text-warning font-bold'}>★★★★★</p>
                <p className={'font-bold font-size-s'}>Rp. {formatNumber(price)}</p>
                <p className={'badge badge-small badge-primary capitalize mt-m text-sm'}>{editor}</p>
                {children}
            </div>
        </article>
    )
})

export default CourseCardComp;