package org.ccpc;

import java.io.FileOutputStream;
import java.io.IOException;
import java.security.*;
import java.util.Base64;
import java.util.Properties;

public class RSAKeyGenerator {

    public static void main(String[] args) {
        try {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
            keyGen.initialize(2048);
            KeyPair keyPair = keyGen.generateKeyPair();

            PrivateKey privateKey = keyPair.getPrivate();
            PublicKey publicKey = keyPair.getPublic();

            String privateKeyBase64 = Base64.getEncoder().encodeToString(privateKey.getEncoded());
            String publicKeyBase64 = Base64.getEncoder().encodeToString(publicKey.getEncoded());

            System.out.println("Private Key (Base64): " + privateKeyBase64);
            System.out.println("Public Key (Base64): " + publicKeyBase64);

            Properties props = new Properties();
            props.setProperty("keys.private", privateKeyBase64);
            props.setProperty("keys.public", publicKeyBase64);

            try (FileOutputStream out = new FileOutputStream("keys.properties")) {
                props.store(out, "Generated RSA keys");
            }

            System.out.println("Ключі збережено у файл keys.properties");

        } catch (NoSuchAlgorithmException | IOException e) {
            e.printStackTrace();
        }
    }
}
