package org.ccpc.isusa.config.dbconfig;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;
import javax.sql.DataSource;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackages = "org.ccpc.isusa.repository.reports", // Тут репозиторії звітів
        entityManagerFactoryRef = "reportsEntityManagerFactory",
        transactionManagerRef = "reportsTransactionManager"
)
public class ReportsDbConfig {

    @Bean(name = "reportsDataSource")
    @ConfigurationProperties(prefix = "reports.datasource")
    public DataSource reportsDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "reportsEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean reportsEntityManagerFactory(
            EntityManagerFactoryBuilder builder, @Qualifier("reportsDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("org.ccpc.isusa.entity.reports") // Сутності для бази звітів
                .persistenceUnit("reports")
                .build();
    }

    @Bean(name = "reportsTransactionManager")
    public PlatformTransactionManager reportsTransactionManager(
            @Qualifier("reportsEntityManagerFactory") EntityManagerFactory factory) {
        return new JpaTransactionManager(factory);
    }
}