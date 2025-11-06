import Header from '../components/Header';

function HeaderOnly({ children, headerMode = 'auto' }) {
    return (
        <>
            <Header mode={headerMode} />
            <main style={{ paddingTop: 'var(--header-height)' }}>{children}</main>
        </>
    );
}

export default HeaderOnly;
