import Header from './Header';

function HeaderOnly({ children }) {
    return (
        <>
            <>
                <Header />
                {children}
            </>
        </>
    );
}

export default HeaderOnly;
