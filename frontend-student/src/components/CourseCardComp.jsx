import {memo} from "react";

const CourseCardComp = memo(({children, title, desc, image}) => {
    return (
        <article className={'border-style-default radius-m grid grid-rows-[212px_1fr] max-w-[500px]'}>
            <img src={import.meta.env.VITE_APP_IMAGE_COURSE_URL + image}
                 className={'radius-s object-fit-cover w-full h-[-webkit-fill-available]'}
                 alt={title}/>
            <div className={'box-border p-m grid grid-rows-[1fr_max-content_max-content]'}>
                <p className={'font-medium font-size-l'}>{title}</p>
                <p className={'font-light'}>{desc?.length > 111 ? desc.slice(0, 111) + '…' : desc}</p>
                {children}
            </div>
        </article>
    )
})

export default CourseCardComp;