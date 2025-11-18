package org.ccpc.isusa.config.keys;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Цей сервіс ЗАВАНТАЖУЄ постійну RSA-пару ключів
 * з 'application.properties' при старті додатку.
 *
 * Це гарантує, що ключі ЗАВЖДИ однакові, і старі підписи
 * залишатимуться дійсними після перезапуску.
 */
@Component
@Getter
public class KeyService {

    private final PrivateKey privateKey;
    private final PublicKey publicKey;

    /**
     * Конструктор, який Spring автоматично викликає при старті.
     * @Value "втягує" рядки з application.properties.
     */
    public KeyService(
            @Value("${isusa.security.keys.private-base64}") String privateKeyBase64,
            @Value("${isusa.security.keys.public-base64}") String publicKeyBase64
    ) {
        try {
            // Конвертуємо Base64-рядки в "живі" об'єкти ключів
            this.privateKey = loadPrivateKey(privateKeyBase64);
            this.publicKey = loadPublicKey(publicKeyBase64);
        } catch (Exception e) {
            throw new RuntimeException("Критична помилка: не вдалося завантажити RSA-ключі з properties", e);
        }
    }

    /**
     * Відтворює PrivateKey з Base64 (PKCS8) рядка.
     */
    private PrivateKey loadPrivateKey(String keyBase64) throws NoSuchAlgorithmException, InvalidKeySpecException {
        byte[] keyBytes = Base64.getDecoder().decode(keyBase64);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePrivate(spec);
    }

    /**
     * Відтворює PublicKey з Base64 (X.509) рядка.
     */
    private PublicKey loadPublicKey(String keyBase64) throws NoSuchAlgorithmException, InvalidKeySpecException {
        byte[] keyBytes = Base64.getDecoder().decode(keyBase64);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePublic(spec);
    }
}