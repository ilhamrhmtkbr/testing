import {memo, useEffect} from "react";
import SetThemeComp from "./SetThemeComp.jsx";
import GetMenuComp from "./GetMenuComp.jsx";
import useAuthStore from "../zustand/store.js";
import {refreshToken} from "../services/service.js";
import {HashLink} from "react-router-hash-link";
import {useTranslation} from "react-i18next";

const Header = memo(() => {
    const user = useAuthStore(state => state.user);
    const {t} = useTranslation();

    useEffect(() => {
        if (!user) {
            const getUser = async () => {
                await refreshToken();
            }

            getUser()
        }
    }, [])

    return <>
        <header className={'header'}>
            <div className={'header-logo'}>
                <img src={'/iamra-logo.svg'} className={'header-logo-img'} alt={import.meta.env.VITE_APP_NAME}/>
                <span>{import.meta.env.VITE_APP_NAME}</span>
            </div>

            <SetThemeComp/>

            <GetMenuComp/>

            <div className={'navigation'}>
                {user ?
                    <a href={user?.role === 'student' ?
                        import.meta.env.VITE_APP_FRONTEND_STUDENT_URL :
                        user?.role === 'instructor' ?
                            import.meta.env.VITE_APP_FRONTEND_INSTRUCTOR_URL :
                            import.meta.env.VITE_APP_FRONTEND_USER_URL + '/member/additional-info#top'}
                       className={'hover-progress truncate'} style={{maxWidth: 111}}>{user.full_name}</a> :
                    <a href={import.meta.env.VITE_APP_FRONTEND_USER_URL + '/authentication#top'}
                       className={'hover-progress truncate'} style={{maxWidth: 111}}>Login</a>
                }
            </div>
        </header>
        <nav>
            <HashLink className={'hover-progress'} to="/#top">
                {t('courses')}
            </HashLink>
            {user ?
                <a href={user?.role === 'student' ?
                    import.meta.env.VITE_APP_FRONTEND_STUDENT_URL :
                    user?.role === 'instructor' ?
                        import.meta.env.VITE_APP_FRONTEND_INSTRUCTOR_URL :
                        import.meta.env.VITE_APP_FRONTEND_USER_URL + '/member/additional-info#top'}
                   className={'hover-progress'}>{t(user.role)}</a> :
                <a href={import.meta.env.VITE_APP_FRONTEND_USER_URL + '/authentication#top'}
                   className={'hover-progress'}>Login</a>
            }
            <HashLink className={'hover-progress'} to="/about#top">
                {t('about')}
            </HashLink>
        </nav>
    </>
})

export default Header