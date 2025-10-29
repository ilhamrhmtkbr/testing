import {memo} from "react";

const CourseCardSkeletonComp = memo(({count = 4}) => {
    return (
        <div className={'card-layout'}>
            {Array.from({length: count}).map((_, index) => (
                <article className={'border-style-default radius-m grid grid-rows-[212px_1fr]'} key={index}>
                    <img className={'radius-s object-fit-cover w-full loading-pulse h-[-webkit-fill-available]'}
                         alt={'ilhamrhmtkbr'}/>
                    <div className={'box-border p-m grid grid-rows-[1fr_max-content_max-content]'}>
                        <p className={'font-medium font-size-l loading-pulse h-[20px]'}></p>
                        <p className={'font-light loading-pulse h-[40px] mt-[7px]'}></p>
                    </div>
                </article>
            ))}
        </div>
    )
})

export default CourseCardSkeletonComp;