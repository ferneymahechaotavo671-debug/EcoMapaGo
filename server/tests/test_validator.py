from app.utils.validator import Validator


def test_correo_valido():

    assert Validator.validar_correo(
        "ferney@gmail.com"
    )


def test_correo_invalido():

    assert not Validator.validar_correo(
        "ferneygmail"
    )


def test_password_valida():

    assert Validator.validar_password(
        "Ferney123!"
    )


def test_password_sin_simbolo_es_invalida():

    assert not Validator.validar_password(
        "Ferney123"
    )


def test_password_invalida():

    assert not Validator.validar_password(
        "123"
    )