import Header from '../components/Header';
import Footer from './Footer';

function DefaultLayout({ children }) {
    return (
        <>
            <>
                <Header />
                {children}
                <Footer />
            </>
        </>
    );
}

export default DefaultLayout;
