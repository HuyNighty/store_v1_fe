import Button from '../../../Button';

function NavLinks() {
    const links = [
        { text: 'Home', to: '/' },
        { text: 'Books', to: '/books' },
        { text: 'About', to: '/about' },
    ];

    return (
        <nav>
            {links.map((link, index) => (
                <Button key={index} to={link.to} text={2.4}>
                    {link.text}
                </Button>
            ))}
        </nav>
    );
}

export default NavLinks;
