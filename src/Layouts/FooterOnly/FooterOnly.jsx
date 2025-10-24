import Footer from '../DefaultLayout/Footer/Footer';

function FooterOnly({ children }) {
    return (
        <>
            {children}
            <Footer />
        </>
    );
}

export default FooterOnly;
