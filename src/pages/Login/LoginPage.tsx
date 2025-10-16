import classes from './Login.module.scss';
// import classes from "./LoginPage.module.scss";
import SiemLogo from '@components/SiemLogo/SiemLogo';
import LoginForm from './components/LoginForm';

const LoginPage: React.FC = () => {
    return (
        <div className={classes['login__container']}>
            <SiemLogo
                size="sm"
                className={classes['login__container-logo']}
            />
            <LoginForm />
        </div>
    );
};

export default LoginPage;
